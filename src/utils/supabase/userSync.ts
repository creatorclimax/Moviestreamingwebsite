import { supabase } from './client';

const TABLE = 'user_data'; // we will store everything per user here

export async function loadUserData(userId: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Load user data error:', error.message);
    return null;
  }

  return data;
}

export async function saveUserData(userId: string, payload: any) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({
      user_id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Save user data error:', error.message);
  }
}
