import React, { useState } from 'react';
import { Container, Typography, Box, Tab, Tabs } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { ShiftCalendar } from './components/ShiftCalendar';
import { StaffUnavailability } from './components/StaffUnavailability';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
          シフト管理システム
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="シフト表" />
            <Tab label="職員管理" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ShiftCalendar />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <StaffUnavailability staffId="example-staff-id" staffName="山田太郎" />
        </TabPanel>
      </Container>
    </LocalizationProvider>
  );
}

export default App; 