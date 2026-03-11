import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import React from 'react';
import { getRouter } from './router';

const router = getRouter();

hydrateRoot(document, <StartClient router={router} />);
