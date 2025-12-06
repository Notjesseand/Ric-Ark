//components/email-template.tsx
import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  message: string;
}

export function EmailTemplate({ firstName, message }: EmailTemplateProps) {
  return (
    <div>
      <h1>{firstName} sent a message!</h1>
      <p>
        Message: <strong>{message}</strong>
      </p>
      <p>
        Please log in to{" "}
        <a href={`${process.env.APP_URL}/client-messages`}>respond</a>.
      </p>
    </div>
  );
}
