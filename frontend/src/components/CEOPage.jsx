import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Database } from 'lucide-react';
import axios from 'axios';
import Chat from './Chat';

const API_URL = '/api';

const CEOPage = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState({ fileCount: 0, active: false });

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/status`);
            setStatus(res.data);
        } catch (err) {
            console.error("Status fetch fail", err);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post(`${API_URL}/upload`, formData);
            fetchStatus();
            alert("Document uploaded and indexed successfully!");
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container">
            <h2 style={{ marginBottom: '2rem' }}>CEO Control Dashboard</h2>

            <div className="dashboard-grid">
                <aside>
                    <div className="card glass-panel">
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Database size={20} className="gradient-text" />
                            Knowledge Base
                        </h3>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{status.fileCount}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Documents Uploaded</div>
                        </div>

                        <label className="upload-zone" style={{ display: 'block' }}>
                            <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                            <Upload size={32} style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
                            <p>{uploading ? "Processing Document..." : "Click to Upload Context"}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PDF, TXT, or DOCX</span>
                        </label>
                    </div>

                    <div className="card glass-panel">
                        <h3 style={{ marginBottom: '0.5rem' }}>Guidance</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Any documents you upload here will be used by the AI to answer questions for both you and your team.
                        </p>
                    </div>
                </aside>

                <main>
                    <Chat role="CEO" />
                </main>
            </div>
        </div>
    );
};

export default CEOPage;
