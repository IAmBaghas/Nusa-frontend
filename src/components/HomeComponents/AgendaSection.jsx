import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'moment/locale/id';
import ReactDOM from 'react-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set timezone and locale
moment.tz.setDefault('Asia/Jakarta');
moment.locale('id');

// Kalender Inggris
// moment.locale('en');

const localizer = momentLocalizer(moment);

const calendarStyles = {
  event: {
    backgroundColor: '#60a5fa',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    padding: '2px 8px',
    fontSize: '13px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease'
  },
  dayCell: {
    backgroundColor: 'white',
    border: '1px solid #f3f4f6',
    minHeight: '120px',
    transition: 'background-color 0.2s ease'
  },
  today: {
    backgroundColor: '#f0f9ff'
  }
};

const AgendaCard = ({ agenda, onClick }) => {
  const date = moment.tz(agenda.start_date, 'Asia/Jakarta');
  const endDate = moment.tz(agenda.end_date, 'Asia/Jakarta');
  const isSameDay = date.isSame(endDate, 'day');
  
  const formatDuration = () => {
    if (isSameDay) {
      return `${date.format('HH:mm')} - ${endDate.format('HH:mm')} WIB, ${date.format('DD MMMM YY')}`;
    } else {
      return `${date.format('HH:mm, DD MMM')} - ${endDate.format('HH:mm, DD MMM YY')} WIB`;
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="card bg-base-100 hover:shadow-md transition-all cursor-pointer border border-base-200"
    >
      <div className="card-body p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center min-w-[60px] text-center p-2 bg-primary/10 rounded-xl border border-primary/20">
            <span className="text-2xl font-bold text-primary">{date.format('D')}</span>
            <span className="text-xs font-medium text-primary/80 uppercase">{date.format('MMM')}</span>
          </div>
          
          <div className="flex-1">
            <h3 className="card-title text-base hover:text-primary transition-colors">
              {agenda.title}
            </h3>
            <p className="text-sm text-base-content/60 mt-1">
              {formatDuration()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgendaModal = ({ agenda, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const startTime = moment.utc(agenda.start_date).tz('Asia/Jakarta');
  const endTime = moment.utc(agenda.end_date).tz('Asia/Jakarta');

  return ReactDOM.createPortal(
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h3 className="font-bold text-xl mb-6">{agenda.title}</h3>
        
        <div className="space-y-6">
          <div className="bg-primary/10 rounded-box p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-base-100 rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Waktu Pelaksanaan</p>
                <p className="text-sm text-base-content/70">
                  {startTime.format('DD MMMM YYYY, HH:mm')} WIB
                </p>
                <p className="text-sm text-base-content/70">
                  s/d {endTime.format('DD MMMM YYYY, HH:mm')} WIB
                </p>
              </div>
            </div>
          </div>

          {agenda.description && (
            <div className="bg-base-200 rounded-box p-4">
              <p className="text-sm whitespace-pre-wrap">
                {agenda.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>,
    document.getElementById('modal-root')
  );
};

const CustomToolbar = (toolbar) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => toolbar.onNavigate('PREV')}
          className="btn btn-circle btn-ghost btn-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => toolbar.onNavigate('TODAY')}
          className="btn btn-sm btn-primary btn-outline"
        >
          Hari Ini
        </button>
        <button
          onClick={() => toolbar.onNavigate('NEXT')}
          className="btn btn-circle btn-ghost btn-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <span className="text-lg font-semibold">
        {moment(toolbar.date).format('MMMM YYYY')}
      </span>
    </div>
  );
};

const AgendaSection = () => {
  const [agenda, setAgenda] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  useEffect(() => {
    fetchAgenda();
  }, []);

  const fetchAgenda = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/agenda');
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      const formattedAgenda = data.map(agenda => ({
        ...agenda,
        start: moment.utc(agenda.start_date).tz('Asia/Jakarta').toDate(),
        end: moment.utc(agenda.end_date).tz('Asia/Jakarta').toDate(),
        start_date: agenda.start_date,
        end_date: agenda.end_date
      }));
      setAgenda(formattedAgenda);
    } catch (error) {
      console.error('Error fetching agenda:', error);
      setError('Failed to load agenda');
    }
  };

  if (error) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Agenda Sekolah
          </h2>
          <div className="divider bg-gray-800 w-24 h-1 rounded-full mx-auto"></div>
        </div>

        <div className="lg:flex gap-8">
          <div className="lg:w-2/3">
            <div className="card bg-base-100 shadow-md border border-base-200/80">
              <div className="card-body">
                <Calendar
                  localizer={localizer}
                  events={agenda}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  views={['month']}
                  defaultView='month'
                  onSelectEvent={setSelectedAgenda}
                  eventPropGetter={() => ({
                    style: calendarStyles.event
                  })}
                  dayPropGetter={(date) => ({
                    style: {
                      ...calendarStyles.dayCell,
                      ...(moment.tz(date, 'Asia/Jakarta').isSame(moment(), 'day') ? calendarStyles.today : {})
                    }
                  })}
                  components={{
                    toolbar: CustomToolbar,
                  }}
                  formats={{
                    monthHeaderFormat: 'MMMM YYYY',
                    weekdayFormat: (date, culture, localizer) => 
                      localizer.format(date, 'dddd', culture),
                    dayFormat: (date, culture, localizer) =>
                      localizer.format(date, 'D', culture),
                    timeGutterFormat: (date, culture, localizer) =>
                      moment.tz(date, 'Asia/Jakarta').format('HH:mm'),
                    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                      `${moment.tz(start, 'Asia/Jakarta').format('HH:mm')} - ${moment.tz(end, 'Asia/Jakarta').format('HH:mm')}`,
                  }}
                  messages={{
                    today: 'Hari Ini',
                    previous: 'Sebelumnya',
                    next: 'Selanjutnya',
                    month: 'Bulan',
                    week: 'Minggu',
                    day: 'Hari',
                    agenda: 'Agenda',
                    noEventsInRange: 'Tidak ada agenda pada rentang waktu ini'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="card bg-base-100 shadow-md border border-base-200/80">
              <div className="card-body">
                <h3 className="card-title text-lg mb-6">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agenda Mendatang
                </h3>

                <div className="space-y-3">
                  {agenda
                    .filter(item => moment.tz(item.end_date, 'Asia/Jakarta').isAfter(moment()))
                    .sort((a, b) => moment(a.start_date).diff(moment(b.start_date)))
                    .map(item => (
                      <AgendaCard
                        key={item.id}
                        agenda={item}
                        onClick={() => setSelectedAgenda(item)}
                      />
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedAgenda && (
          <AgendaModal
            agenda={selectedAgenda}
            onClose={() => setSelectedAgenda(null)}
          />
        )}
      </div>
    </section>
  );
};

export default AgendaSection;