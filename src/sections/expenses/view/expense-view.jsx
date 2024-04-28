import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { users } from 'src/_mock/user';
import { fetchExpenses } from 'src/services/firebaseServices';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import ExpenseTableRow from '../expense-table-row';
import TableEmptyRows from '../table-empty-rows';
import UserTableHead from '../expense-table-head';
import UserTableToolbar from '../expense-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function ExpensePage() {
  
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      fetchExpenses().then(data => {
          setExpenses(data);
          setLoading(false);
      });
  }, []);
  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Expenses</Typography>

        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
          Add Expense
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
            <UserTableHead
  order={order}
  orderBy={orderBy}
  rowCount={expenses.length}
  numSelected={selected.length}
  onRequestSort={handleSort}
  onSelectAllClick={handleSelectAllClick}
  headLabel={[
    { id: 'username', label: 'Username' },
    { id: 'expenseType', label: 'Expense Type' },
    { id: 'date', label: 'Date' },
    { id: 'totalAmount', label: 'Amount' },
    { id: 'isApproved', label: 'Approved', align: 'center' },
    { id: 'actions', label: 'Actions', align: 'right' },
  ]}
/>

              <TableBody>
              {expenses
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((expense) => (
    <ExpenseTableRow
      key={expense.id}
      username={expense.username}
      expenseType={expense.expenseType}
      date={new Date(expense.date).toLocaleDateString()}
      totalAmount={expense.totalAmount}
      isApproved={expense.isApproved}
      selected={selected.indexOf(expense.id) !== -1}
      handleClick={(event) => handleClick(event, expense.id)}
    />
  ))
}


                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}