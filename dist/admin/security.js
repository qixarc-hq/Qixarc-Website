(() => {
  const passwordError = ({currentPassword, newPassword, confirmation}) => {
    if (!currentPassword) return 'Enter your current password.';
    if (newPassword.length < 12 || newPassword.length > 128) return 'Use a new password between 12 and 128 characters.';
    if (newPassword !== confirmation) return 'The new passwords do not match.';
    if (newPassword === currentPassword) return 'Choose a different password from your current one.';
    return '';
  };
  async function endSessions(auth, scope) {
    if (!['local', 'others', 'global'].includes(scope)) throw new Error('Invalid session scope');
    try {
      const {error} = await auth.signOut({scope});
      if (!error) return true;
    } catch {}
    if (scope !== 'others') {
      try { await auth.signOut({scope: 'local'}); } catch {}
    }
    return false;
  }
  async function changePassword(auth, values, canManage, onChanged) {
    const invalid = passwordError(values);
    if (invalid) throw new Error(invalid);
    const {data, error} = await auth.getUser();
    if (error || !data.user?.email || !await canManage()) throw new Error('Your admin session has ended. Sign in again.');
    const user = data.user;
    const login = await auth.signInWithPassword({email: user.email, password: values.currentPassword});
    if (login.error || login.data.user?.id !== user.id) throw new Error('Current password could not be verified. Try again.');
    if (!await canManage()) throw new Error('This account no longer has admin access.');
    const result = await auth.updateUser({password: values.newPassword, current_password: values.currentPassword});
    if (result.error) {
      const code = result.error.code;
      if (code === 'weak_password') throw new Error('Choose a stronger password or a longer unique passphrase.');
      if (code === 'same_password') throw new Error('Choose a different password from your current one.');
      if (code === 'reauthentication_needed' || code === 'reauthentication_not_valid') throw new Error('Sign out and sign in again before changing your password.');
      throw new Error('Password was not changed. Check your current password and connection, then retry.');
    }
    onChanged();
    return {sessionsRevoked: await endSessions(auth, 'global')};
  }
  window.QixarcSecurity = Object.freeze({passwordError, changePassword, endSessions});
})();
