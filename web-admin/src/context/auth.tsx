import { NEW_PASSWORD_REQUIRED_ERROR, WRONG_CREDS_ERROR } from 'consts';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AWSService } from 'services';
import { completeNewPasswordChallenge, signInWithEmail } from 'services/aws';

export enum AuthStatus {
  Loading,
  SignedIn,
  SignedOut,
}

export interface IAuth {
  sessionInfo?: { username?: string; email?: string; sub?: string; accessToken?: string; refreshToken?: string }
  attrInfo?: any
  authStatus?: AuthStatus
  signIn?: any
  isNewUser?: boolean,
  setSignInDetails: any,
  setNewPassword?: any,
  signInDetails: {password: string, email: string},
  newPassword: string,
  signOut?: any
  completeNewPassword?: any
  verifyCode?: any
  getSession?: any
  sendCode?: any
  forgotPassword?: any
  changePassword?: any
  getAttributes?: any
  setAttribute?: any
}

const defaultState: IAuth = {
  sessionInfo: {},
  authStatus: AuthStatus.Loading,
  signInDetails: { password: "", email: ""},
  setSignInDetails: () => {},
  newPassword: ""
};

export const AuthContext = React.createContext(defaultState)

export const AuthIsSignedIn: React.FunctionComponent = ({ children }) => {
  const history = useHistory();
  const { authStatus }: IAuth = useContext(AuthContext)

  return <>{authStatus === AuthStatus.SignedIn ? children : history.push('/login')}</>
}

export const AuthIsNotSignedIn: React.FunctionComponent = ({ children }) => {
  const history = useHistory();
  const { authStatus }: IAuth = useContext(AuthContext)

  return <>{authStatus !== AuthStatus.SignedIn ? children : history.push('/dashboard')}</>
}

const AuthProvider: React.FunctionComponent = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(AuthStatus.Loading)
  const [sessionInfo, setSessionInfo] = useState({})
  const [signInDetails, setSignInDetails] = useState({email: "", password: ""})
  const [newPassword, setNewPassword] = useState("")
  const [isNewUser, setIsNewUser] = useState(false);
  const [userAttributes, setUserAttributes] = useState({});
  const history = useHistory();

  useEffect(() => {
    async function getSessionInfo() {
      try {
        const session: any = await getSession()
        console.log("🚀 ~ file: auth.tsx ~ line 66 ~ getSessionInfo ~ session", session)
        setSessionInfo({
          accessToken: session.accessToken.jwtToken,
          refreshToken: session.refreshToken.token,
        })
        window.localStorage.setItem('accessToken', `${session.accessToken.jwtToken}`)
        window.localStorage.setItem('refreshToken', `${session.refreshToken.token}`)
        setAuthStatus(AuthStatus.SignedIn)
      } catch (err) {
        setAuthStatus(AuthStatus.SignedOut)
      }
    }
    getSessionInfo()
  }, [setAuthStatus, authStatus])


  const completeNewPassword = async () => {
    const response: any = await completeNewPasswordChallenge(userAttributes, newPassword);
    if(!response.success) {
      history.push('/');
    }
  }

  const signIn = async () => {
    const { email, password } = signInDetails; 
    const response: any = await signInWithEmail(email, password);
    if(!response.success){
      if(response?.data?.error?.message === NEW_PASSWORD_REQUIRED_ERROR){
        setUserAttributes(response?.data?.attributes);
        setIsNewUser(true);
        return;
      }    
      if(response?.data?.error?.message === WRONG_CREDS_ERROR){
        toast.error('Wrong Username or Password. Please Try Again.')
        return;
      }    
    }
    if(response?.success){
      setAuthStatus(AuthStatus.SignedIn);
      history.push('/');
    }
  }

  const signOut = () => {
    AWSService.signOut();
    setAuthStatus(AuthStatus.SignedOut);
    history.push('/login');
  }

  const getSession = async () => {
    try {
      const session = await AWSService.getSession()
      return session
    } catch (err) {
      throw err
    }
  }

  const forgotPassword = async (username: string, code: string, password: string) => {
    try {
      await AWSService.forgotPassword(username, code, password)
    } catch (err) {
      throw err
    }
  }

  const changePassword = async (username: string, oldPassword: string, newPassword: string) => {
    try {
      await AWSService.changePassword(username, oldPassword, newPassword)
    } catch (err) {
      throw err
    }
  }

  const state: IAuth = {
    authStatus,
    sessionInfo,
    signIn,
    signOut,
    getSession,
    isNewUser,
    setSignInDetails,
    completeNewPassword,
    setNewPassword,
    signInDetails,
    newPassword,
    forgotPassword,
    changePassword,
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export default AuthProvider

  // const signInWithEmail = async (email: string, password: string) => {
  //   try {
  //     await AWSService.signInWithEmail(email, password)
  //     setAuthStatus(AuthStatus.SignedIn)
  //   } catch (err) {
  //     setAuthStatus(AuthStatus.SignedOut)
  //     throw err
  //   }
  // }