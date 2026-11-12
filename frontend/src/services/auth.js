
import { supabase } from "../lib/supabase";

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  return data.session;
};

export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  return data.subscription;
};
