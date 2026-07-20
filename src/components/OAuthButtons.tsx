import { useToast } from "../context/ToastContext";

interface Props {
  action: string;
}

export default function OAuthButtons({ action }: Props) {
  const toast = useToast();

  const handleOAuth = (provider: string) => {
    toast.info(
      `${provider} Coming Soon! 🚀`,
      `${provider} sign-in will be available in the next update.`
    );
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
              transition: 'all 0.2s',
            }}
          >
            {action} with {provider}
          </button>
        ))}
      </div>
    </div>
  );
}