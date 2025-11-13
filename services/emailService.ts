import type { Team } from '../types';

// This is a browser-only app, so we can declare the global `emailjs` object
// that is loaded from the script tag in index.html.
declare global {
  interface Window {
    emailjs: {
      init: (config: { publicKey: string }) => void;
      send: (serviceID: string, templateID: string, templateParams: Record<string, unknown>) => Promise<any>;
    };
  }
}

// Helper function for robust email validation
const isValidEmail = (email: string | null | undefined): email is string => {
    if (!email || email.trim().length === 0) {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


interface EmailConfig {
    serviceId: string;
}

interface ConfirmationEmailParams extends EmailConfig {
  team: Team;
  iban: string;
  adminEmail: string;
  templateId: string;
}

export const sendConfirmationEmail = ({ team, iban, adminEmail, serviceId, templateId }: ConfirmationEmailParams) => {
    console.log("Envio de e-mail automático desativado.");
    return Promise.resolve();
};

interface AdminNotificationParams extends EmailConfig {
    newTeam: Team;
    allTeams: Team[];
    adminEmail: string;
    templateId: string;
}

export const sendAdminNotificationEmail = ({ newTeam, allTeams, adminEmail, serviceId, templateId }: AdminNotificationParams) => {
    console.log("Envio de e-mail automático desativado.");
    return Promise.resolve();
};

interface ReminderEmailParams extends EmailConfig {
    team: Team;
    iban: string;
    adminEmail: string;
    templateId: string;
}

export const sendReminderEmail = ({ team, iban, adminEmail, serviceId, templateId }: ReminderEmailParams) => {
    console.log("Envio de e-mail automático desativado.");
    return Promise.resolve();
};

interface ContactFormParams extends EmailConfig {
    name: string;
    title: string;
    email: string;
    contactTemplateId: string;
}

export const sendContactEmail = ({ name, title, email, serviceId, contactTemplateId }: ContactFormParams) => {
    console.log("Envio de e-mail automático desativado.");
    return Promise.resolve();
};

interface AIStudioRequestParams extends EmailConfig {
    name: string;
    title: string;
    adminEmail: string;
    aiStudioTemplateId: string;
}

export const sendAIStudioRequestEmail = ({ name, title, adminEmail, serviceId, aiStudioTemplateId }: AIStudioRequestParams) => {
    console.log("Envio de e-mail automático desativado.");
    return Promise.resolve();
};