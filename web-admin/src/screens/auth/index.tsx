import { AuthContext } from 'context/auth';
import { useContext } from 'react';
import ChangePasswordScreen from './ChangePassword';
import LoginScreen from './login';

const AuthPage = (props: any) => {
  const { signInDetails, completeNewPassword, setSignInDetails, newPassword, setNewPassword, isNewUser, signIn} = useContext(AuthContext);
  const { email, password } = signInDetails;


  if (isNewUser) {
    return <ChangePasswordScreen 
      email={email} 
      newPassword={newPassword} 
      setNewPassword={setNewPassword} 
      handler={completeNewPassword}
      oldPassword={password} />
  } else {
    return <LoginScreen 
      email={email} 
      password={password} 
      setLoginDetails={setSignInDetails} 
      loginHandler={signIn}/>  
  }
};

export default AuthPage;
