import { Router } from 'express';
import { access } from 'fs';
import { get } from 'lodash';
import {
  getSegmentControllser,
  getStatusUploadHLSVideoController,
  getVideoHLSController,
  uploadImage,
  uploadPDF,
  uploadVideo,
  uploadVideoHLS
} from '~/controllers/mediasControllers';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/usersMiddlewares';
import { catchError } from '~/utils/handler';

const router = Router();
router.post('/upload-image', accessTokenValidator, verifiedUserValidator, catchError(uploadImage));
router.post('/upload-pdf', accessTokenValidator, verifiedUserValidator, catchError(uploadPDF));
router.post('/upload-video', accessTokenValidator, verifiedUserValidator, catchError(uploadVideo));
router.post('/upload-video-hls', accessTokenValidator, verifiedUserValidator, catchError(uploadVideoHLS));
router.get('/video-hls/:id/master.m3u8', catchError(getVideoHLSController));
router.get('/video-hls/:id/:v/:segment', catchError(getSegmentControllser));
router.get('/getStatusUploadVideoHLS/:id', catchError(getStatusUploadHLSVideoController));

export default router;
