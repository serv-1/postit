import MailSent from 'app/pages/mail-sent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mail Sent - PostIt',
}

export default function Page() {
  return <MailSent />
}
