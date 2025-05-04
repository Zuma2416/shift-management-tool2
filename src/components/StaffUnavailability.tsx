import React, { useState, useEffect } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface StaffUnavailabilityProps {
  staffId: string;
  staffName: string;
}

export const StaffUnavailability: React.FC<StaffUnavailabilityProps> = ({ staffId, staffName }) => {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchUnavailableDates();
  }, [staffId]);

  const fetchUnavailableDates = async () => {
    const staffDoc = await getDoc(doc(db, 'staff', staffId));
    if (staffDoc.exists()) {
      setUnavailableDates(staffDoc.data().unavailableDates || []);
    }
  };

  const handleAddUnavailableDate = async () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const newDates = [...unavailableDates, formattedDate];
      
      await updateDoc(doc(db, 'staff', staffId), {
        unavailableDates: newDates
      });
      
      setUnavailableDates(newDates);
      setSelectedDate(null);
      setOpenDialog(false);
    }
  };

  const handleRemoveDate = async (dateToRemove: string) => {
    const newDates = unavailableDates.filter(date => date !== dateToRemove);
    
    await updateDoc(doc(db, 'staff', staffId), {
      unavailableDates: newDates
    });
    
    setUnavailableDates(newDates);
  };

  return (
    <Paper style={{ padding: '20px', margin: '20px 0' }}>
      <h3>{staffName}の出勤不可日</h3>
      
      <Button 
        variant="contained" 
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: '20px' }}
      >
        出勤不可日を追加
      </Button>

      <List>
        {unavailableDates.sort().map(date => (
          <ListItem key={date}>
            <ListItemText 
              primary={format(new Date(date), 'yyyy年M月d日 (E)', { locale: ja })} 
            />
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => handleRemoveDate(date)}
            >
              削除
            </Button>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>出勤不可日を追加</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <DatePicker
              label="日付を選択"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
          <Button onClick={handleAddUnavailableDate}>追加</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}; 