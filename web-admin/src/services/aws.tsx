import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { NEW_PASSWORD_REQUIRED_ERROR } from 'consts';

// const userPoolId = 
// const clientId = 

const poolData = {
	UserPoolId: process.env.REACT_APP_USERPOOL_ID || '',
	ClientId: process.env.REACT_APP_CLIENT_ID || ''
};

const userPool: CognitoUserPool = new CognitoUserPool(poolData)

let currentUser: any = userPool.getCurrentUser()

export function getCurrentUser() {
  return currentUser
}

const getCognitoUser = (username: string) => {
	const userData = {
		Username: username,
		Pool: userPool,
	}
	const cognitoUser = new CognitoUser(userData)

	return cognitoUser
}

export async function getSession() {
	const currentUser = userPool.getCurrentUser()

	return new Promise(function (resolve, reject) {
		currentUser?.getSession(function (err: any, session: any) {
			if (err) {
				reject(err)
			} else {
				resolve(session)
			}
		})
	}).catch((err) => {
		throw err
	})
}

export async function signInWithEmail(username: string, password: string) {
	return new Promise(function (resolve, reject) {
		const authenticationData = {
			Username: username,
			Password: password,
		}
		const authenticationDetails = new AuthenticationDetails(authenticationData)
    currentUser = getCognitoUser(username)

		return currentUser.authenticateUser(authenticationDetails, {
			onSuccess: function (res: any) {
				console.log("🚀 ~ file: aws.tsx ~ line 66 ~ res", res)
				resolve ({ success: true, data: res });
			},
			onFailure: function (error: any) {
				resolve ({ success: false, data: {error: { message: error.message}} });
			},
			newPasswordRequired: function (userAttributes:any, requiredAttributes:any) {
				resolve({ success: false, data: { error: { message: NEW_PASSWORD_REQUIRED_ERROR }, attributes: requiredAttributes}});
			}
		})
	}).catch((err) => {
		throw err
	})
}

export function signOut() {
	const currentUser = userPool.getCurrentUser()
	if (currentUser) {
		currentUser.signOut()
	}
}

export async function forgotPassword(username: string, code: string, password: string) {
	return new Promise(function (resolve, reject) {
		const currentUser = getCognitoUser(username)

		if (!currentUser) {
			reject(`could not find ${username}`)
			return
		}

		currentUser.confirmPassword(code, password, {
			onSuccess: function () {
				resolve('password updated')
			},
			onFailure: function (err) {
				reject(err)
			},
		})
	})
}

export  function changePassword(username: string, oldPassword: string, newPassword: string) {
	return new Promise(function (resolve, reject) {
		const currentUser = getCognitoUser(username)
		currentUser.changePassword(oldPassword, newPassword, function (err: any, res: any) {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}

export function completeNewPasswordChallenge(userAttr: any, newPassword: string) {
	return new Promise(function (resolve, reject) {
		currentUser.completeNewPasswordChallenge(newPassword, userAttr, {
			onFailure: (error: any) => {
				resolve({success: false, data: {error}})
			},
			onSuccess: () => {
				resolve({success: true})
			},
		})
	})
}