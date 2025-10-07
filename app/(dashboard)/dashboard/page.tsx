'use client'

import { useState } from 'react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardContent from '@/components/dashboard/DashboardContent'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Profile Settings')

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <DashboardContent activeTab={activeTab} />
    </div>
  )
}
