import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { debugLog, errorLog, measurePerformance } from '../utils/debug';

interface Staff {
  id: string;
  name: string;
  unavailableDates: string[];
}

interface ShiftEntry {
  id: string;
  staffId: string;
  date: string;
  shiftType: string;
  note?: string;
}

const shiftTypes = [
  '①朝番',
  '②日勤',
  '③昼番',
  '④夜勤',
  '⑤夜番',
  '夜間支援員'
];

export const ShiftCalendar: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const selectedMonth = useState(new Date())[0];
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');

  useEffect(() => {
    measurePerformance('ShiftCalendar.fetchStaffAndShifts', () => {
      fetchStaffAndShifts();
    });
  }, []);

  const fetchStaffAndShifts = async () => {
    try {
      debugLog('Fetching staff and shifts data');
      
      const staffSnapshot = await getDocs(collection(db, 'staff'));
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Staff));
      setStaff(staffData);
      debugLog('Staff data fetched', staffData);

      const shiftsSnapshot = await getDocs(collection(db, 'shifts'));
      const shiftsData = shiftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ShiftEntry));
      setShifts(shiftsData);
      debugLog('Shifts data fetched', shiftsData);
    } catch (error) {
      errorLog(error as Error, 'fetchStaffAndShifts');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const handleAddStaff = async () => {
    try {
      if (newStaffName.trim()) {
        debugLog('Adding new staff member', { name: newStaffName });
        
        await addDoc(collection(db, 'staff'), {
          name: newStaffName,
          unavailableDates: []
        });
        
        setNewStaffName('');
        setOpenStaffDialog(false);
        await fetchStaffAndShifts();
        
        debugLog('New staff member added successfully');
      }
    } catch (error) {
      errorLog(error as Error, 'handleAddStaff');
    }
  };

  const handleShiftChange = async (staffId: string, date: string, shiftType: string) => {
    try {
      debugLog('Updating shift', { staffId, date, shiftType });
      
      const existingShift = shifts.find(s => s.staffId === staffId && s.date === date);
      
      if (existingShift) {
        await updateDoc(doc(db, 'shifts', existingShift.id), {
          shiftType
        });
        debugLog('Existing shift updated');
      } else {
        await addDoc(collection(db, 'shifts'), {
          staffId,
          date,
          shiftType
        });
        debugLog('New shift added');
      }
      
      await fetchStaffAndShifts();
    } catch (error) {
      errorLog(error as Error, 'handleShiftChange');
    }
  };

  return (
    <div>
      <Button 
        variant="contained" 
        onClick={() => setOpenStaffDialog(true)}
        style={{ margin: '20px 0' }}
      >
        職員を追加
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日付</TableCell>
              {staff.map(s => (
                <TableCell key={s.id}>{s.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {getDaysInMonth(selectedMonth).map(date => (
              <TableRow key={date.toISOString()}>
                <TableCell>
                  {format(date, 'M/d (E)', { locale: ja })}
                </TableCell>
                {staff.map(s => (
                  <TableCell key={s.id}>
                    <FormControl fullWidth>
                      <Select
                        value={shifts.find(
                          shift => 
                            shift.staffId === s.id && 
                            shift.date === format(date, 'yyyy-MM-dd')
                        )?.shiftType || ''}
                        onChange={(e) => handleShiftChange(
                          s.id,
                          format(date, 'yyyy-MM-dd'),
                          e.target.value
                        )}
                      >
                        <MenuItem value="">-</MenuItem>
                        {shiftTypes.map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openStaffDialog} onClose={() => setOpenStaffDialog(false)}>
        <DialogTitle>新しい職員を追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="職員名"
            fullWidth
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStaffDialog(false)}>キャンセル</Button>
          <Button onClick={handleAddStaff}>追加</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}; 