interface Props {
  action: string;
}

export default function OAuthButtons({ action }: Props) {
  const handleOAuth = (provider: string) => {
    alert(`${provider} sign-in coming soon!`);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#334155' }} />
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: '#334155' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {['Google', 'GitHub'].map(provider => (
          <button
            key={provider}
            type="button"
            onClick={() => handleOAuth(provider)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #334155',
              background: 'transparent',
              color: 'white',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            {action} with {provider}
          </button>
        ))}
      </div>
    </div>
  );
}