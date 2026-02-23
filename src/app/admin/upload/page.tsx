import FileUploader from '@/components/FileUploader';

export default function UploadPage() {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Upload Konten</h1>
                <p className="page-description">
                    Upload file Minecraft (.mcpack, .mcworld, .mcaddon, .zip, .mctemplate, .tar) hingga 5GB
                </p>
            </div>

            <FileUploader />
        </div>
    );
}
