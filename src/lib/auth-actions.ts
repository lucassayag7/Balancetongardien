"use server";

import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function signUp(formData: {
  email: string;
  password: string;
  pseudo: string;
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient();

    // Vérifier si le pseudo est déjà pris
    const existing = await prisma.user.findUnique({ where: { pseudo: formData.pseudo } });
    if (existing) return { error: "Ce pseudo est déjà utilisé, choisissez-en un autre." };

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { pseudo: formData.pseudo } },
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: "Erreur lors de la création du compte." };

    // Créer le profil dans Prisma
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { email: formData.email, pseudo: formData.pseudo },
      create: { id: data.user.id, email: formData.email, pseudo: formData.pseudo },
    });

    return { success: true };
  } catch (e) {
    console.error("[signUp]", e);
    return { error: "Erreur serveur. Réessayez." };
  }
}

export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Email ou mot de passe incorrect." };
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: "Confirmez votre email avant de vous connecter (vérifiez vos spams)." };
      }
      return { error: error.message };
    }

    return { success: true };
  } catch (e) {
    console.error("[signIn]", e);
    return { error: "Erreur serveur. Réessayez." };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
}
