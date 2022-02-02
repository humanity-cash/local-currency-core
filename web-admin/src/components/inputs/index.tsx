
import TextField from '@material-ui/core/TextField';

interface InputProps {
  onChange: any 
  value: string
};

export const Password = (props: InputProps) => {
  const { onChange, value } = props
  return (
    <TextField 
			{...props}
      fullWidth 
      label="Password" 
      name="password" 
      value={value}
      type="password"
      onChange={onChange}
      size="small" 
      variant="outlined" />
  )
}

export const Email = (props: InputProps) => {
  const { onChange, value } = props
  return (
    <TextField 
			{...props}
      fullWidth 
      label="Email" 
      name="email" 
      value={value}
      onChange={onChange}
      size="small" 
      variant="outlined" />
  )
}
