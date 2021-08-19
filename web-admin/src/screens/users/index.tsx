import { TableTemplate } from 'components';
import { useUsersData } from 'hooks';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { UserData } from 'types';

interface Column {
	id: keyof UserData;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: any) => any;
  onClick?: (value: any) => any;
  clickable?: boolean;
}

const useColumns = () => {
	const history = useHistory();
	const columns: Column[] = [
		{
			id: 'name',
			label: 'Name',
			minWidth: 170,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{ id: 'email', label: 'Email', minWidth: 170 },
		{ id: 'dowllaId', label: 'Dowlla Id', minWidth: 100 },
		{
			id: 'outstandingBalance',
			label: 'Balance',
			minWidth: 170,
			format: (value: number) => value + ' B$',
		},
		{
			id: 'lastLogin',
			label: 'Last Login',
			minWidth: 170,
			format: (value: number) => moment().format(),
		},
		{
			id: 'blockchainAddress',
			label: 'Wallet Address',
			minWidth: 170,
			format: (value: string) => value,
		},
		{
			id: 'address',
			label: 'address',
			minWidth: 170,
			format: (value: string) => value,
		},
		{
			id: 'type',
			label: 'Type',
			minWidth: 170,
			format: (value: string) => value,
		},
	];

	return columns;
};

const UsersTable = () => {
	const columns = useColumns();
	const data: UserData[] = useUsersData();

	return <TableTemplate data={data} columns={columns} />;
};

export default UsersTable;
