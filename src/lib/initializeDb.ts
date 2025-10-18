export async function initializeDatabase() {
  try {
    const response = await fetch('https://cugdqifdxmcqrqvokaes.supabase.co/functions/v1/init-database', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z2RxaWZkeG1jcXJxdm9rYWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjExMjUsImV4cCI6MjA3NjA5NzEyNX0.iPNrBDwznV8VO9oz9YmcEabDVWIFY69MUp-gId4DXfk',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('Database initialized successfully');
      return true;
    } else {
      console.error('Database initialization failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}
