'use client';

import { useEffect, useState } from 'react';
import { MultiSelect, Container, Title, TextInput,
        Card, Text, Group, Badge, Stack, Modal, Button } from '@mantine/core';
import { PillsInput, Pill, Combobox, CheckIcon, useCombobox } from '@mantine/core';
import { SimpleGrid } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import UploadMapresModal from "./uploadmodal";
import MapresModal from "./mapresmodal";


import { getMapres, getImageURL } from './api';
import { Mapres } from './mapres';

import TagSearcher from './tagsearcher';


export default function Page() {
  const [mapresList, setMapresList] = useState<Mapres[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [uploadOpened, { open: openUpload, close: closeUpload }] = useDisclosure(false);
  const [mapresOpened, { open: openMapres, close: closeMapres }] = useDisclosure(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedMapres, setSelectedMapres] = useState<Mapres | null>(null);


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
    <Container size="xl" py="md">
      <Title height={60}>
          teeDB
      </Title>
      <Text>
        the simplest mapres db for Teeworlds{' '}
        <span
          onClick={openUpload}
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

      <UploadMapresModal opened={uploadOpened} onClose={closeUpload} onSuccess={() => alert("Uploaded!")} />
      <MapresModal
        opened={mapresOpened}
        onClose={() => {
          closeMapres();
          setSelectedMapres(null);
        }}
        mapres={selectedMapres}
      />

      <Stack spacing="md" mt="md">
        
        <TagSearcher
          data={availableTags}
          value={tags}
          onChange={setTags}
          placeholder="Search for tags... (e.g. unhookable, quad, tileset, etc.)"
        />

        <SimpleGrid
          cols={4}
          spacing="md"
          breakpoints={[
            { maxWidth: '62rem', cols: 2 },
            { maxWidth: '36rem', cols: 1 },
          ]}
        >
          {mapresList
            .filter((mapres) =>
              tags.length === 0 || tags.every((tag) => mapres.tags.includes(tag))
            )
            .map((mapres) => (
              <Card
                key={mapres.name}
                shadow="sm"
                padding={0}
                radius="md"
                withBorder
                onClick={() => {
                  setSelectedMapres(mapres);
                  openMapres();
                }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: `
                    linear-gradient(45deg, #eee 25%, transparent 25%),
                    linear-gradient(-45deg, #eee 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #eee 75%),
                    linear-gradient(-45deg, transparent 75%, #eee 75%)`,
                  backgroundSize: '32px 32px',
                  backgroundPosition: '0 0, 0 16px, 16px -16px, -16px 0px',
                }}
              >
                <img
                  src={getImageURL(mapres.name)}
                  alt={mapres.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#000',
                    boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {mapres.name}
                </div>
              </Card>
            ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}