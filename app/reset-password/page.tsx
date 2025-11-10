import ResetPasswordForm from 'components/ResetPasswordForm'
import SendResetPasswordLinkForm from 'components/SendResetPasswordLinkForm'

type SearchParams = Promise<
  | { email?: never; token: string; userId: string }
  | { email?: string; token?: never; userId?: never }
>

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const { token, email, userId } = searchParams

  return (
    <main className="md:h-[486px] mb-auto md:shadow-wrapper md:flex">
      <div className="flex flex-col gap-y-16 rounded-16 bg-fuchsia-50/60 backdrop-blur-[4px] shadow-glass p-32 md:backdrop-blur-none md:bg-fuchsia-50 md:shadow-none md:w-1/2 md:rounded-r-none md:items-center">
        <h1 className="md:w-[350px]">Reset Password</h1>
        {token ? (
          <>
            <p className="md:w-[350px] mb-16">
              You can now change your password.
            </p>
            <ResetPasswordForm userId={userId} token={token} />
          </>
        ) : (
          <>
            <p className="md:w-[350px] mb-16">
              Please check your email inbox for a link to reset your password.
            </p>
            <SendResetPasswordLinkForm email={email} />
          </>
        )}
      </div>
      <div
        className="hidden md:block w-1/2 rounded-r-16"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #f0abfc 25%, transparent 25%), linear-gradient(225deg, #f0abfc 25%, transparent 25%), linear-gradient(45deg, #f0abfc 25%, transparent 25%), linear-gradient(315deg, #f0abfc 25%, #E879F9 25%)',
          backgroundPosition: ' 10px 0, 10px 0, 0 0, 0 0',
          backgroundSize: '20px 20px',
          backgroundRepeat: 'repeat',
        }}
      ></div>
    </main>
  )
}
