"use client";

import {
  Button,
  FileInput,
  Modal,
  TextInput,
  TagsInput,
  Group,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { IconUpload } from "@tabler/icons-react";
import { setAPIKey } from "./api";
import { getAPIKey } from "./api";
import { useEffect } from "react";
import { Kbd } from '@mantine/core';


type UploadMapresModalProps = {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function UploadMapresModal({
  opened,
  onClose,
  onSuccess,
}: UploadMapresModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");

    useEffect(() => {
        setKeyInput(getAPIKey() || "");
    }, []);

  const form = useForm({
    initialValues: {
      name: "",
      author: "",
      tags: [] as string[],
      main: null as File | null,
      rules: null as File | null,
      example: null as File | null,
    },

    validate: {
        name: (value) => (!value ? "Mapres name is required" : null),
        main: (value) => (!value ? "Main image is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    const key = getAPIKey();
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.author) formData.append("author", values.author);
    values.tags.forEach((tag) => formData.append("tags", tag));
    if (values.main) {
        const renamedMain = new File([values.main], `${values.name}.png`, {
            type: values.main.type,
        });
        formData.append(`${values.name}.png`, renamedMain);
    }

    if (values.rules) {
        const renamedRules = new File([values.rules], `${values.name}.rules`, {
            type: values.rules.type,
        });
        formData.append(`${values.name}.rules`, renamedRules);
    }

    if (values.example) {
        const renamedExample = new File([values.example], `${values.name}_example.png`, {
            type: values.example.type,
        });
        formData.append(`${values.name}_example.png`, renamedExample);
    }

    try {
    const res = await fetch(`http://localhost:5000/upload?key=${encodeURIComponent(key || "")}`, {
      method: "POST",
      body: formData,
    });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Upload failed");
      onSuccess?.();
      form.reset();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Upload Mapres" centered size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
            <Group gap="xs">
            <TextInput
                label="Set Key"
                placeholder="Enter key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.currentTarget.value)}
                style={{ flex: 1 }}
            />
            <Button
                variant="outline"
                mt={22}
                onClick={() => setAPIKey(keyInput)}
            >
                Set Key
            </Button>
            </Group>
          <TextInput
            label="Name"
            placeholder="my_mapres"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Author"
            placeholder="Unknown"
            {...form.getInputProps("author")}
          />
          <TagsInput
            label="Tags"
            description="Press Enter to add"
            placeholder="unhookable, quad, tileset, etc."
            {...form.getInputProps("tags")}
          />

          <FileInput
            label="Mapres (.png)"
            placeholder="Upload file"
            clearable
            accept="image/png"
            withAsterisk
            leftSection={<IconUpload size={20} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("main")}
          />

          <FileInput
            label="Autorules (.rules file)"
            placeholder="Upload file (optional)"
            clearable
            accept=".rules"
            leftSection={<IconUpload size={20} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("rules")}
          />

          <FileInput
            label="Example Image (.png)"
            placeholder="Upload file (optional)"
            clearable
            accept="image/png"
            leftSection={<IconUpload size={20} />}
            leftSectionPointerEvents="none"
            {...form.getInputProps("example")}
          />

          {error && <Text c="red">{error}</Text>}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Upload
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
