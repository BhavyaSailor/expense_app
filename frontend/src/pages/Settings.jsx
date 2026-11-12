function Settings() {
  return (
    <div className="settings-page">
      <div className="page-heading">
        <h1 className="page-title">Settings</h1>
        <p className="text-muted">Configure your experience, notifications, and security.</p>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Theme</h2>
            <div className="input-group">
              <label>Mode</label>
              <select defaultValue="light">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-inner">
            <h2 className="section-title">Security</h2>
            <div className="input-group">
              <label>Change password</label>
              <button className="button secondary">Update password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
