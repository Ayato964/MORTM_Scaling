import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserPage = repoName?.match(/\.github\.io$/);

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_REPOSITORY ? (isUserPage ? '/' : `/${repoName}/`) : '/',
})
