'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/* -----------------------------
   Validation Setup
----------------------------- */

const usernameRegex = /^[A-Za-z0-9_-]{3,20}$/
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{1,50}$/
const phoneDigits = (s: string) => (s || '').replace(/\D+/g, '')
const isPasswordStrong = (s: string) =>
  /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s)

const formSchema = z.object({
  username: z
    .string()
    .regex(usernameRegex, '3–20 letters, numbers, underscores, or hyphens only'),
  referrer: z
    .string()
    .regex(usernameRegex, 'Enter a valid referrer username')
    .min(3, 'Referrer username required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .refine(isPasswordStrong, 'Include upper, lower, number, and symbol'),
  firstName: z.string().regex(nameRegex, 'Only letters, spaces, - and \' allowed'),
  lastName: z.string().regex(nameRegex, 'Only letters, spaces, - and \' allowed'),
  phone: z
    .string()
    .transform((v) => phoneDigits(v))
    .refine((v) => v.length === 0 || (v.length >= 10 && v.length <= 15), 'Enter a valid phone number')
    .optional(),
  dob: z
    .string()
    .refine((val) => {
      const d = new Date(val)
      if (Number.isNaN(d.getTime())) return false
      const age = new Date().getFullYear() - d.getFullYear()
      return age >= 13 && age <= 120
    }, 'You must be between 13 and 120 years old'),
})

type FormValues = z.infer<typeof formSchema>

/* -----------------------------
   Component
----------------------------- */

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()

  const [usernameChecked, setUsernameChecked] = useState<boolean | null>(null)
  const [referrerChecked, setReferrerChecked] = useState<boolean | null>(null)
  const [referrerId, setReferrerId] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [checkingReferrer, setCheckingReferrer] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      referrer: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      dob: '',
    },
  })

  const usernameVal = form.watch('username')
  const referrerVal = form.watch('referrer')

  useMemo(() => {
    setUsernameChecked(null)
    setReferrerChecked(null)
  }, [usernameVal])

  useMemo(() => {
    setReferrerChecked(null)
    setReferrerId(null)
  }, [referrerVal])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'referrer') {
        form.clearErrors('referrer')
        setReferrerChecked(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  /* -----------------------------
     Check Username Availability
  ----------------------------- */
  const checkUsername = useCallback(async () => {
    const uname = (form.getValues('username') || '').trim()
    if (!usernameRegex.test(uname)) {
      form.setError('username', { message: 'Invalid username format' })
      return
    }

    setCheckingUsername(true)
    try {
      const { data, error } = await supabase.rpc('username_available', { uname })
      if (error) throw error

      if (data === true) {
        setUsernameChecked(true)
        form.clearErrors('username')
        toast.success('Username is available!')
      } else {
        setUsernameChecked(false)
        form.setError('username', { message: 'Username already taken' })
        toast.error('Username already taken.')
      }
    } catch {
      toast.error('Could not check username. Try again later.')
    } finally {
      setCheckingUsername(false)
    }
  }, [form, supabase])

  /* -----------------------------
     Check Referrer Username
  ----------------------------- */
  const checkReferrer = useCallback(async () => {
    const rname = (form.getValues('referrer') || '').trim()
    if (!usernameChecked) {
      toast.error('Check your username first.')
      return
    }
    if (!usernameRegex.test(rname)) {
      form.setError('referrer', { message: 'Invalid referrer username' })
      return
    }

    setCheckingReferrer(true)
    try {
      const { data, error } = await supabase.rpc('lookup_referrer_id', { uname: rname })
      if (error) throw error

      if (data) {
        setReferrerId(String(data))
        setReferrerChecked(true)
        form.clearErrors('referrer')
        toast.success('Referrer verified.')
      } else {
        setReferrerChecked(false)
        form.setError('referrer', { message: 'Referrer not found' })
        toast.error('Referrer not found.')
      }
    } catch {
      toast.error('Could not verify referrer.')
    } finally {
      setCheckingReferrer(false)
    }
  }, [form, supabase, usernameChecked])

  /* -----------------------------
    Submit Form (atomic signup)
  ----------------------------- */
  const onSubmit = async (values: FormValues) => {
    if (!usernameChecked) {
      toast.error('Please check username availability.')
      return
    }
    if (!referrerChecked || !values.referrer.trim()) {
      toast.error('Please verify your referrer.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone ? phoneDigits(values.phone) : null,
          dob: values.dob,
          referrerUsername: values.referrer.trim(),
          role: 'basic_member',
        }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result?.message || 'Signup failed.')

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password.trim(),
      })

      if (loginError) {
        toast.error('Account created, but auto-login failed. Please log in manually.')
        router.push('/login')
        return
      }

      toast.success('Account created and logged in!')
      router.push('/dashboard')

    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* -----------------------------
     JSX Layout
  ----------------------------- */
  return (
    <div className="max-w-md mx-auto mt-12 bg-white border rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6 text-center">Create Account</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Step 1: Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="your_username" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkUsername}
                    disabled={checkingUsername || !field.value}
                  >
                    {checkingUsername ? 'Checking…' : 'Check'}
                  </Button>
                </div>
                <FormMessage />
                {usernameChecked === true && (
                  <p className="text-xs text-green-600 mt-1">✓ Available</p>
                )}
                {usernameChecked === false && (
                  <p className="text-xs text-red-600 mt-1">✗ Taken</p>
                )}
              </FormItem>
            )}
          />

          {/* Step 2: Referrer */}
          {usernameChecked && (
            <FormField
              control={form.control}
              name="referrer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referrer’s Username *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="referrer_username" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={checkReferrer}
                      disabled={checkingReferrer || !field.value}
                    >
                      {checkingReferrer ? 'Checking…' : 'Verify'}
                    </Button>
                  </div>
                  <FormMessage />
                  {referrerChecked === true && (
                    <p className="text-xs text-green-600 mt-1">✓ Referrer verified</p>
                  )}
                  {referrerChecked === false && (
                    <p className="text-xs text-red-600 mt-1">✗ Referrer not found</p>
                  )}
                </FormItem>
              )}
            />
          )}

          {/* Step 3: Rest of Fields */}
          {usernameChecked && referrerChecked && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="At least 12 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Include upper, lower, number, and symbol.
                    </p>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(###) ###-####" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !(usernameChecked && referrerChecked)}
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
