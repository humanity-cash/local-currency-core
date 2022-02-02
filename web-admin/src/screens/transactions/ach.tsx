import { FilterTable } from 'components';
import { useACHData } from 'hooks';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { ACHData, ACHDataState } from 'types';
import { iconStatus } from 'utils';

interface Column {
  name: keyof ACHData
  title: string;
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
			name: 'transactionId',
			title: 'ID',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/transaction/${value}`),
		},
		{ name: 'type', title: 'Type', minWidth: 100 },
		{
			name: 'username',
			title: 'User',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{
			name: 'createdAt',
			title: 'Created At',
			minWidth: 100,
			format: (value: number) => moment().format(),
		},
		{
			name: 'confirmedAt',
			title: 'Confirmed At',
			minWidth: 100,
			format: (value: number) => moment().format(),
		},
		{
			name: 'userBank',
			title: 'User Bank',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/bank/${value}`),
		},
		{
			name: 'berksharesBank',
			title: 'Berkshares Bank',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/bank/${value}`),
		},
		{
			name: 'amount',
			title: 'Amount',
			minWidth: 100,
			format: (value: number) => value.toLocaleString('en-US') + ' $',
		},
		{
			name: 'status',
			title: 'Status',
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
		<div
			style={{
				paddingLeft: '19em',
				paddingTop: '2em',
				paddingRight: '2em',
			}}>
			<FilterTable rows={state.data} columns={columns} />
		</div>
  );
}

export default ACHDataTable;