import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useStore } from 'react-hookstore';
import { MODAL_STORE } from 'store';
import { ModalState } from 'types';

const MODAL_COMPONENTS: any = {
  'TEST_MODAL': () => <div>Hello World</div>
};

const Modal = () => {
  const [modalState, setModalState]: [ModalState, any] = useStore(MODAL_STORE);
  const { isOpen, type, modalProps } = modalState
  const ChildComponent = MODAL_COMPONENTS[type];
  const handleClose = () => {
    setModalState({isOpen: false, type: '', modalProps: {}})
  };

  return (
		<div>
			<Dialog
				open={isOpen}
				onClose={handleClose}
				aria-labelledby='form-dialog-title'>
				<DialogTitle id='form-dialog-title'>Lorem Ipsum</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Lorem Ipsum is simply dummy text of the printing and
						typesetting industry. Lorem Ipsum has been the
						industry's standard dummy text ever since the 1500s
					</DialogContentText>
					{/* <ChildComponent {...modalProps} /> */}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color='primary'>
						Cancel
					</Button>
					<Button onClick={handleClose} color='primary'>
						Stop Contract
					</Button>
				</DialogActions>
			</Dialog>
		</div>
  );
}

export default Modal;