import React from 'react';
import Chat from './Chat';
import { Info } from 'lucide-react';

const UserPage = () => {
    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Company Knowledge AI</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Access organizational intelligence powered by verified documents.
                </p>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(0, 123, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 123, 255, 0.2)' }}>
                <Info className="text-primary" style={{ marginTop: '2px' }} />
                <div style={{ fontSize: '0.9rem' }}>
                    <strong>Note:</strong> This assistant answers based on documents uploaded by the CEO. It cannot perform actions but provides insights into company policy, strategy, and research.
                </div>
            </div>

            <Chat role="Team Member" />
        </div>
    );
};

export default UserPage;
