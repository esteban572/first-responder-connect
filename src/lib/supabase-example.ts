/**
 * Example usage of Supabase client
 * 
 * This file demonstrates common Supabase operations.
 * You can delete this file once you're familiar with Supabase.
 */

import { supabase } from './supabase';

// Example: Fetch all rows from a table
export async function fetchAllFromTable(tableName: string) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
  
  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  
  return data;
}

// Example: Insert a new row
export async function insertRow(tableName: string, row: Record<string, any>) {
  const { data, error } = await supabase
    .from(tableName)
    .insert(row)
    .select();
  
  if (error) {
    console.error('Error inserting data:', error);
    return null;
  }
  
  return data;
}

// Example: Update a row
export async function updateRow(
  tableName: string,
  id: string | number,
  updates: Record<string, any>
) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating data:', error);
    return null;
  }
  
  return data;
}

// Example: Delete a row
export async function deleteRow(tableName: string, id: string | number) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting data:', error);
    return false;
  }
  
  return true;
}

// Example: Real-time subscription
export function subscribeToTable(
  tableName: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`${tableName}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
      },
      callback
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// Example: Authentication - Sign up
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing up:', error);
    return null;
  }
  
  return data;
}

// Example: Authentication - Sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error);
    return null;
  }
  
  return data;
}

// Example: Authentication - Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  
  return true;
}

// Example: Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}
