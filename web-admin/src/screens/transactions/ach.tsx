import { TableTemplate } from 'components';
import { useACHData } from 'hooks';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { ACHData, ACHDataState } from 'types';
import { iconStatus } from 'utils';

interface Column {
  id: keyof ACHData
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
			id: 'transactionId',
			label: 'ID',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/transaction/${value}`),
		},
		{ id: 'type', label: 'Type', minWidth: 100 },
		{
			id: 'username',
			label: 'User',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{
			id: 'createdAt',
			label: 'Created At',
			minWidth: 100,
			format: (value: number) => moment().format(),
		},
		{
			id: 'confirmedAt',
			label: 'Confirmed At',
			minWidth: 100,
			format: (value: number) => moment().format(),
		},
		{
			id: 'bank',
			label: 'Bank',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/bank/${value}`),
		},
		{
			id: 'amount',
			label: 'Amount',
			minWidth: 100,
			format: (value: number) => value.toLocaleString('en-US') + ' $',
		},
		{
			id: 'status',
			label: 'Status',
			minWidth: 100,
			format: (value: any) => iconStatus(value),
		},
	];

	return columns;
};

const ACHDataTable = () => {
	const state: ACHDataState = useACHData();
	const columns = useColumns(); 

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default ACHDataTable;