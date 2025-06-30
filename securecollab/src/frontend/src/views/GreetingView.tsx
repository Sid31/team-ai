import { ChangeEvent, useState } from "react";
import { Button, Card, InputField } from "../components";

interface GreetingViewProps {
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * GreetingView component for handling the greeting functionality
 */
export function GreetingView({ onError, setLoading }: GreetingViewProps) {
  const [name, setName] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const handleChangeText = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!event?.target.value && event?.target.value !== "") {
      return;
    }
    setName(event.target.value);
  };

  const fetchGreeting = async () => {
    try {
      setLoading(true);
      // Greeting functionality not implemented in current backend
      const res = `Hello, ${name || 'World'}! Welcome to SecureCollab.`;
      setResponse(res);
    } catch (err) {
      console.error(err);
      onError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Greeting">
      <InputField
        value={name}
        onChange={handleChangeText}
        placeholder="Enter your name"
      />
      <Button onClick={fetchGreeting}>Get Greeting</Button>
      {!!response && (
        <div className={`mt-4 rounded bg-gray-700 p-4 font-bold`}>
          {response}
        </div>
      )}
    </Card>
  );
}
