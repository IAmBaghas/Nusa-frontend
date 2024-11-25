import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/id';  // Import Indonesian locale
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Kalender Indonesia
moment.locale('id');

// Kalender Inggris
// moment.locale('en');

const localizer = momentLocalizer(moment);

// Replace the calendarStyles object with CSS string
const calendarStyles = `
  .rbc-calendar {
    font-family: var(--font-primary);
  }

  .rbc-event {
    background-color: #60a5fa;
    color: white;
    border-radius: 6px;
    border: none;
    padding: 2px 8px;
    font-size: 13px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }

  .rbc-day-bg {
    background-color: white;
    border: 1px solid #f3f4f6;
    min-height: 120px;
    transition: background-color 0.2s ease;
  }

  .rbc-today {
    background-color: #f0f9ff !important;
  }

  .rbc-off-range-bg {
    background-color: #f9fafb;
  }

  .rbc-header {
    padding: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
  }

  .rbc-day-bg + .rbc-day-bg {
    border-left: 1px solid #e5e7eb;
  }

  .rbc-month-row + .rbc-month-row {
    border-top: 1px solid #e5e7eb;
  }

  .rbc-date-cell {
    padding: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .rbc-date-cell.rbc-now {
    font-weight: 600;
    color: var(--primary);
  }

  .rbc-current-time-indicator {
    background-color: var(--primary);
  }
`;

// Add scrollbar hide styles
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Custom Toolbar Component
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
      <span className="text-base font-medium text-gray-600">
        {moment(toolbar.date).format('MMMM YYYY')}
      </span>
    </div>
  );
};

const AgendaManagement = () => {
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAgendaModal, setShowAgendaModal] = useState(false);
    const [selectedAgenda, setSelectedAgenda] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        start_time: '00:00',
        end_date: '',
        end_time: '00:00',
    });

    useEffect(() => {
        fetchAgenda();
    }, []);

    const handleCloseModal = () => {
        setShowAgendaModal(false);
        setSelectedAgenda(null);
        setFormData({
            title: '',
            description: '',
            start_date: '',
            start_time: '00:00',
            end_date: '',
            end_time: '00:00',
        });
    };

    const handleSelectSlot = ({ start }) => {
        const startMoment = moment(start).tz('Asia/Jakarta');
        setFormData({
            title: '',
            description: '',
            start_date: startMoment.format('YYYY-MM-DD'),
            start_time: startMoment.format('HH:mm'),
            end_date: startMoment.format('YYYY-MM-DD'),
            end_time: startMoment.format('HH:mm')
        });
        setShowAgendaModal(true);
    };

    const handleSelectAgenda = (agenda) => {
        const startMoment = moment(agenda.start).tz('Asia/Jakarta');
        const endMoment = moment(agenda.end).tz('Asia/Jakarta');
        
        setSelectedAgenda(agenda);
        setFormData({
            title: agenda.title,
            description: agenda.description,
            start_date: startMoment.format('YYYY-MM-DD'),
            start_time: startMoment.format('HH:mm'),
            end_date: endMoment.format('YYYY-MM-DD'),
            end_time: endMoment.format('HH:mm')
        });
        setShowAgendaModal(true);
    };

    const fetchAgenda = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5000/api/agenda');
            
            const formattedAgenda = response.data.map(agenda => ({
                id: agenda.id,
                title: agenda.title,
                description: agenda.description,
                start: moment.utc(agenda.start_date).tz('Asia/Jakarta').toDate(),
                end: moment.utc(agenda.end_date).tz('Asia/Jakarta').toDate()
            }));

            setAgenda(formattedAgenda);
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to load agenda items');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                const alertError = document.getElementById('alert_error');
                if (alertError) alertError.showModal();
                return;
            }

            // Create moment objects in local timezone
            const startMoment = moment.tz(
                `${formData.start_date} ${formData.start_time}`, 
                'YYYY-MM-DD HH:mm', 
                'Asia/Jakarta'
            );
            const endMoment = moment.tz(
                `${formData.end_date} ${formData.end_time}`, 
                'YYYY-MM-DD HH:mm', 
                'Asia/Jakarta'
            );

            // Format as ISO string but preserve the intended time
            const startDateTime = startMoment.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            const endDateTime = endMoment.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

            console.log('Submitting times:', {
                inputStartTime: formData.start_time,
                inputEndTime: formData.end_time,
                startDateTime,
                endDateTime
            });

            const requestData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                start_date: startDateTime,
                end_date: endDateTime
            };

            const url = selectedAgenda 
                ? `http://localhost:5000/api/agenda/${selectedAgenda.id}`
                : 'http://localhost:5000/api/agenda';

            // eslint-disable-next-line no-unused-vars
            const response = await axios({
                method: selectedAgenda ? 'PUT' : 'POST',
                url: url,
                headers: { 'Authorization': `Bearer ${token}` },
                data: requestData
            });

            await fetchAgenda();
            handleCloseModal();
            const alertSuccess = document.getElementById('alert_success');
            if (alertSuccess) alertSuccess.showModal();
        } catch (error) {
            console.error('Submit error:', error);
            const alertError = document.getElementById('alert_error');
            if (alertError) alertError.showModal();
        }
    };

    const handleDelete = async () => {
        if (!selectedAgenda) return;
        
        // Show confirmation dialog
        document.getElementById('confirm_delete').showModal();
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                const alertError = document.getElementById('alert_error');
                if (alertError) alertError.showModal();
                return;
            }

            await axios({
                method: 'DELETE',
                url: `http://localhost:5000/api/agenda/${selectedAgenda.id}`,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchAgenda();
            handleCloseModal();
            const alertSuccess = document.getElementById('alert_success');
            if (alertSuccess) alertSuccess.showModal();
        } catch (error) {
            console.error('Delete error:', error);
            const alertError = document.getElementById('alert_error');
            if (alertError) alertError.showModal();
        }
    };

    const AgendaCard = ({ event, onClick }) => {
        const isSameDay = moment(event.start).isSame(event.end, 'day');

        const formatDuration = () => {
            if (isSameDay) {
                return `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm, DD MMM YY')}`;
            } else {
                return `${moment(event.start).format('HH:mm, DD MMM')} - ${moment(event.end).format('HH:mm, DD MMM YY')}`;
            }
        };

        return (
            <div 
                className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                onClick={() => onClick(event)}
            >
                <div className="card-body p-4">
                    <div className="flex items-start gap-4">
                        {/* Date Display */}
                        <div className="bg-primary text-primary-content rounded-lg p-2 text-center min-w-[60px]">
                            <div className="text-sm font-medium">
                                {moment(event.start).format('MMM')}
                            </div>
                            <div className="text-xl font-bold">
                                {moment(event.start).format('DD')}
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                            <h4 className="font-medium line-clamp-2">{event.title}</h4>
                            <p className="text-sm opacity-70 mt-1">
                                {formatDuration()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return null;

    if (error) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg text-red-500">Error: {error}</div>
        </div>
    );

    return (
        <div className="min-h-full">
            <style>{calendarStyles}</style>
            <style>{scrollbarHideStyle}</style>

            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Agenda</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kelola jadwal dan kegiatan sekolah
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calendar Section - Full width on mobile/tablet, 8 cols on desktop */}
                <div className="lg:col-span-8">
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="card-body transition-all duration-300 animate-fadeIn">
                            <div style={{ height: window.innerWidth >= 1024 ? '700px' : '400px' }}>
                                <Calendar
                                    localizer={localizer}
                                    events={agenda}
                                    startAccessor="start"
                                    endAccessor="end"
                                    selectable
                                    onSelectSlot={handleSelectSlot}
                                    onSelectEvent={handleSelectAgenda}
                                    views={['month']}
                                    defaultView='month'
                                    components={{
                                        toolbar: CustomToolbar
                                    }}
                                    formats={{
                                        monthHeaderFormat: 'MMMM YYYY',
                                        weekdayFormat: (date, culture, localizer) => 
                                            localizer.format(date, 'dddd', culture),
                                        dayFormat: (date, culture, localizer) =>
                                            localizer.format(date, 'D', culture)
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
                                    popup
                                    popupOffset={30}
                                    style={{ height: window.innerWidth >= 1024 ? 700 : 400 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel - Full width on mobile/tablet, 4 cols on desktop */}
                <div className="lg:col-span-4">
                    {/* Upcoming Events */}
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="card-body transition-all duration-300 animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Agenda Mendatang</h3>
                                <button
                                    onClick={() => setShowAgendaModal(true)}
                                    className="btn btn-primary btn-sm gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">Tambah</span>
                                </button>
                            </div>
                            
                            <div 
                                className="space-y-4 scrollbar-hide overflow-y-auto" 
                                style={{ 
                                    maxHeight: window.innerWidth >= 1024 ? 'calc(100vh - 16rem)' : '300px'
                                }}
                            >
                                {agenda
                                    .filter(event => moment(event.start).isAfter(moment()))
                                    .sort((a, b) => moment(a.start).diff(moment(b.start)))
                                    .slice(0, 5)
                                    .map((event) => (
                                        <AgendaCard
                                            key={event.id}
                                            event={event}
                                            onClick={handleSelectAgenda}
                                        />
                                    ))}

                                {agenda.filter(event => moment(event.start).isAfter(moment())).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Tidak ada agenda mendatang
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Past Events - Hidden on mobile */}
                    <div className="hidden lg:block card bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                        <div className="card-body transition-all duration-300 animate-fadeIn">
                            <h3 className="font-semibold text-lg mb-4">Agenda Lalu</h3>
                            <div className="space-y-4 scrollbar-hide overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
                                {agenda
                                    .filter(event => moment(event.end).isBefore(moment()))
                                    .sort((a, b) => moment(b.end).diff(moment(a.end)))
                                    .slice(0, 5)
                                    .map((event) => (
                                        <AgendaCard
                                            key={event.id}
                                            event={event}
                                            onClick={handleSelectAgenda}
                                        />
                                    ))}

                                {agenda.filter(event => moment(event.end).isBefore(moment())).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Tidak ada agenda lalu
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showAgendaModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-xl font-bold">
                                {selectedAgenda ? 'Edit Agenda' : 'Tambah Agenda Baru'}
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="btn btn-sm btn-circle btn-ghost"
                            >✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title & Description Section */}
                            <div className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Judul Agenda</span>
                                        <span className="label-text-alt text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="input input-bordered w-full"
                                        placeholder="Masukkan judul agenda"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Deskripsi</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="textarea textarea-bordered min-h-[120px]"
                                        placeholder="Masukkan deskripsi agenda"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Date and Time Section */}
                            <div className="bg-base-200 rounded-lg p-4 space-y-6">
                                <h4 className="font-medium text-base-content/70">Waktu Pelaksanaan</h4>
                                
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Start Date/Time */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Mulai</span>
                                            <span className="label-text-alt text-error">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="form-control flex-1">
                                                <input
                                                    type="date"
                                                    value={formData.start_date}
                                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                                <label className="label">
                                                    <span className="label-text-alt">Tanggal</span>
                                                </label>
                                            </div>
                                            <div className="form-control w-32">
                                                <input
                                                    type="time"
                                                    value={formData.start_time}
                                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                                <label className="label">
                                                    <span className="label-text-alt">Jam</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* End Date/Time */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Selesai</span>
                                            <span className="label-text-alt text-error">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="form-control flex-1">
                                                <input
                                                    type="date"
                                                    value={formData.end_date}
                                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                                <label className="label">
                                                    <span className="label-text-alt">Tanggal</span>
                                                </label>
                                            </div>
                                            <div className="form-control w-32">
                                                <input
                                                    type="time"
                                                    value={formData.end_time}
                                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                                    className="input input-bordered w-full"
                                                    required
                                                />
                                                <label className="label">
                                                    <span className="label-text-alt">Jam</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="modal-action flex items-center justify-between pt-4 border-t">
                                <div>
                                    {selectedAgenda && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="btn btn-error btn-outline btn-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Hapus Agenda
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn btn-ghost"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {selectedAgenda ? 'Simpan Perubahan' : 'Buat Agenda'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            )}

            {/* Alert Modals */}
            <dialog id="confirm_delete" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
                    <p className="py-4">Apakah Anda yakin ingin menghapus agenda ini?</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-ghost mr-2">Batal</button>
                            <button onClick={confirmDelete} className="btn btn-error">Hapus</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_success" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg">Berhasil</h3>
                    <p className="py-4">
                        {selectedAgenda 
                            ? 'Agenda berhasil diperbarui'
                            : 'Agenda berhasil dibuat'}
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_error" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Terjadi kesalahan. Silakan coba lagi.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_error_validation" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-error">Validasi Error</h3>
                    <p className="py-4">Mohon lengkapi semua field yang diperlukan.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default AgendaManagement; 