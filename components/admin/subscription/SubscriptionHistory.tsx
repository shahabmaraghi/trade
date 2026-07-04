"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/admin/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/admin/ui/table"

interface Transaction {
  _id: string
  planId: {
    _id: string
    title: string
    price: number
  }
  amount: number
  status: string
  paymentMethod: string
  startDate: string
  endDate: string
  createdAt: string
}

export function SubscriptionHistory() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/subscriptions/history")
        if (response.ok) {
          const data = await response.json()
          setTransactions(data)
        }
      } catch (error) {
        console.error("Error fetching subscription history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Format status
  const formatStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "تکمیل شده"
      case "pending":
        return "در انتظار"
      case "failed":
        return "ناموفق"
      case "refunded":
        return "بازگشت وجه"
      default:
        return status
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تاریخچه اشتراک</CardTitle>
        <CardDescription>سوابق پرداخت و اشتراک‌های شما</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>در حال بارگذاری تاریخچه...</p>
        ) : transactions.length === 0 ? (
          <p>هیچ تراکنشی یافت نشد.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاریخ</TableHead>
                <TableHead>اشتراک</TableHead>
                <TableHead>مبلغ (تومان)</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ انقضا</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>{transaction.planId.title}</TableCell>
                  <TableCell>{transaction.amount.toLocaleString("fa-IR")}</TableCell>
                  <TableCell>{formatStatus(transaction.status)}</TableCell>
                  <TableCell>{formatDate(transaction.endDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
