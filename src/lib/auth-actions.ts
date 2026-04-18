"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function signUp(formData: {
  email: string;
  password: string;
  pseudo: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { pseudo: formData.pseudo },
    },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Erreur lors de la création du compte." };

  await prisma.user.create({
    data: {
      id: data.user.id,
      email: formData.email,
      pseudo: formData.pseudo,
    },
  });

  redirect("/");
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) return { error: "Email ou mot de passe incorrect." };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
