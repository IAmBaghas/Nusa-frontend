import React from 'react';

const GalleryAlert = () => {
  return (
    <>
      {/* Delete Gallery Confirmation */}
      <dialog id="confirm_delete_gallery" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
          <p className="py-4">Apakah anda yakin ingin menghapus galeri ini? Semua foto dalam galeri ini akan ikut terhapus.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Batal</button>
              <button 
                onClick={() => {
                  window.confirmDeleteGallery();
                  document.getElementById('confirm_delete_gallery').close();
                }}
                className="btn btn-error"
              >
                Hapus
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Delete Image Confirmation */}
      <dialog id="confirm_delete_image" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
          <p className="py-4">Apakah Anda yakin ingin menghapus foto ini?</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Batal</button>
              <button onClick={() => window.confirmDeleteImage()} className="btn btn-error">Hapus</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Success Alert */}
      <dialog id="alert_success" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Berhasil</h3>
          <p className="py-4">Operasi berhasil dilakukan</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">OK</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Error Alert */}
      <dialog id="alert_error" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Error</h3>
          <p className="py-4">Terjadi kesalahan. Silakan coba lagi.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">OK</button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Validation Error Alert */}
      <dialog id="alert_error_validation" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Validasi Error</h3>
          <p className="py-4">Mohon lengkapi nama galeri dan pilih minimal satu foto.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">OK</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default GalleryAlert; 