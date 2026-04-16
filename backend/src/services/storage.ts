import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);

const uploadDir = path.join(process.cwd(), 'uploads');

export class StorageService {
  /**
   * Получить URL файла
   */
  static getFileUrl(userId: string, filename: string): string {
    return `/uploads/${userId}/${filename}`;
  }

  /**
   * Получить полный путь к файлу
   */
  static getFilePath(userId: string, filename: string): string {
    return path.join(uploadDir, userId, filename);
  }

  /**
   * Проверить существование файла
   */
  static async fileExists(userId: string, filename: string): Promise<boolean> {
    const filePath = this.getFilePath(userId, filename);
    return existsAsync(filePath);
  }

  /**
   * Удалить файл (userId='cms' для CMS файлов)
   */
  static async deleteFile(userId: string, filename: string): Promise<void> {
    const filePath = this.getFilePath(userId, filename);

    if (await this.fileExists(userId, filename)) {
      await unlinkAsync(filePath);
    }
  }

  /**
   * Удалить файл по полному пути
   */
  static async deleteByPath(relativePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), relativePath);
    if (await existsAsync(fullPath)) {
      await unlinkAsync(fullPath);
    }
  }

  /**
   * Удалить файл по URL
   */
  static async deleteFileByUrl(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return;
    }

    const parts = fileUrl.split('/');
    if (parts.length < 4) return;

    const userId = parts[2];
    const filename = parts[3];

    await this.deleteFile(userId, filename);
  }

  /**
   * Получить размер файла
   */
  static async getFileSize(userId: string, filename: string): Promise<number> {
    const filePath = this.getFilePath(userId, filename);
    const stats = await promisify(fs.stat)(filePath);
    return stats.size;
  }
}
