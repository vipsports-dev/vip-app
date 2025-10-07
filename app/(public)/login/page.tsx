'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabaseClient'

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

const supabase = createClient()

/* -----------------------------
   Validation Schema
----------------------------- */
const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(3, 'Required')
    .max(255, 'Too long')
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/* -----------------------------
   Page Component
----------------------------- */
export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      const input = values.emailOrUsername.trim()
      let email = input

      // Step 1. Detect if user entered a username instead of email
      if (!input.includes('@')) {
        const { data: userLookup, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('username', input)
          .maybeSingle()

        if (lookupError) throw lookupError
        if (!userLookup?.email) {
          toast.error('Username not found')
          setLoading(false)
          return
        }

        email = userLookup.email
      }

      // Step 2. Attempt Auth login with resolved email
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: values.password.trim(),
      })

      if (loginError) {
        toast.error('Invalid credentials')
        setLoading(false)
        return
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm border rounded-2xl p-6 shadow-sm bg-background">
        <h1 className="text-2xl font-semibold text-center mb-6">Log in</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter email or username"
                      disabled={loading}
                      autoComplete="username"
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter password"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Don’t have an account?{' '}
          <a
            href="/signup"
            className="text-primary hover:underline"
          >
            Sign up
          </a>
        </p>

        <p className="text-xs text-center mt-2">
          <a href="/forgot-password" className="text-muted-foreground hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  )
}
