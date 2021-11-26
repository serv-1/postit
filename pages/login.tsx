import Head from 'next/head'

const Login = () => {
  return (
    <>
      <Head>
        <title>Filanad - Log in!</title>
      </Head>
      <h1 className="bg-primary text-light rounded-top p-2 m-0">Log in!</h1>
      <form
        name="login"
        id="login"
        method="get"
        action=""
        noValidate
        className="p-2 text-end"
      >
        <div className="mb-3 text-start">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input type="email" id="email" className="form-control" />
        </div>
        <div className="mb-3 text-start">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input type="password" id="password" className="form-control" />
        </div>
        <input type="submit" value="Log in" className="btn btn-primary" />
      </form>
    </>
  )
}

export default Login
