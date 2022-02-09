const zxcvbn = (password: string, userInputs?: string[]) => {
  if (userInputs && userInputs.includes(password)) return { score: 0 }
  else if (password.length < 10) return { score: 1 }
  else if (password.length >= 10 && password.length < 15) return { score: 3 }
  else return { score: 4 }
}

export default zxcvbn
