'use client';

import { useEffect, useState } from 'react';
import { MultiSelect, Container, Title, TextInput,
        Card, Text, Group, Badge, Stack, Modal, Button } from '@mantine/core';
import { PillsInput, Pill, Combobox, CheckIcon, useCombobox } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import UploadMapresModal from "./uploadmodal";


import { getMapres, getImageURL } from './api';
import { Mapres } from './mapres';

import TagSearcher from './tagsearcher';


export default function Page() {
  const [mapresList, setMapresList] = useState<Mapres[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [tags, setTags] = useState<string[]>([]);

  // fetch available tags on mount
  useEffect(() => {
    getMapres()
      .then(data => {
        setMapresList(Object.values(data) as Mapres[]);
        // data is an object: { [name]: Mapres }
        const allTags = new Set<string>();
        (Object.values(data) as Mapres[]).forEach((mapres: Mapres) => {
          mapres.tags.forEach((tag: string) => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags).sort());
      })
      .catch(err => {
        console.error("Failed to fetch mapres:", err);
      });
  }, []);

  return (
    <Container size="sm" py="md">
      <Title height={60}>
          teeDB
      </Title>
      <Text>
        the simplest mapres db for Teeworlds{' '}
        <span
          onClick={open}
          style={{
        color: '#228be6',
        cursor: 'pointer',
        transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#1864ab')}
          onMouseOut={e => (e.currentTarget.style.color = '#228be6')}
        >
          (upload)
        </span>
      </Text>

      <UploadMapresModal opened={opened} onClose={close} onSuccess={() => alert("Uploaded!")} />


      <Stack spacing="md" mt="md">
        
        <TagSearcher
          data={availableTags}
          value={tags}
          onChange={setTags}
          placeholder="Search for tags... (e.g. unhookable, quad, tileset, etc.)"
        />

        <Group grow align="stretch" spacing="md" style={{ flexWrap: 'wrap' }}>
          {mapresList
            .filter((mapres) =>
              tags.length === 0 || tags.every((tag) => mapres.tags.includes(tag))
            )
            .map((mapres, idx) => (
                <Card key={mapres.name} shadow="sm" padding="lg" radius="md" withBorder style={{ flex: '1 1 45%', minWidth: 250, maxWidth: '48%', marginBottom: 16 }}>
                <img
                  src={getImageURL(mapres.name)}
                  alt={mapres.name}
                  style={{ width: '100%', height: 150, objectFit: 'contain', marginBottom: 12 }}
                />
                <Stack spacing="xs">
                  <Title order={4}>{mapres.name}</Title>
                  <Text size="sm" color="dimmed">
                    by {mapres.author}
                  </Text>
                </Stack>
              </Card>
            ))}
        </Group>
        
      </Stack>
    </Container>
  );
}