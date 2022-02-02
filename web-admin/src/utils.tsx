
import CheckTwoToneIcon from '@material-ui/icons/CheckTwoTone';
import ErrorTwoToneIcon from '@material-ui/icons/ErrorTwoTone';
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';

export const iconStatus = (value: string) => {
  return value === 'Fail' ? (
				<ErrorTwoToneIcon style={{color: 'red'}}/>
			) : value === 'Success' ? (
				<CheckTwoToneIcon style={{color: 'green'}}/>
			) : (
				<HourglassFullTwoToneIcon />
			)
}