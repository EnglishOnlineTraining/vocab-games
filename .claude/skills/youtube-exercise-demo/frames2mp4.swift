// Encodes JPEG frames into an H.264 MP4 with AVFoundation (no ffmpeg needed).
// Usage: swift frames2mp4.swift <frame dir> <out.mp4>
// The frame dir holds 000000.jpg … plus times.txt: one "<file> <ms since start>" per line.
import AVFoundation
import AppKit

let args = CommandLine.arguments
let dir = URL(fileURLWithPath: args[1]), out = URL(fileURLWithPath: args[2])
let lines = try! String(contentsOf: dir.appendingPathComponent("times.txt"), encoding: .utf8)
  .split(separator: "\n").map { $0.split(separator: " ") }
let W = 1280, H = 720

try? FileManager.default.removeItem(at: out)
let writer = try! AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 4_000_000]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

func buffer(_ url: URL) -> CVPixelBuffer {
  var pb: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
  let b = pb!
  CVPixelBufferLockBaseAddress(b, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(b), width: W, height: H, bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(b), space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)!
  let img = NSImage(contentsOf: url)!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
  CVPixelBufferUnlockBaseAddress(b, [])
  return b
}

var lastMs = -1
for l in lines where l.count == 2 {
  let ms = Int(l[1])!
  if ms <= lastMs { continue }  // timestamps must strictly increase
  while !input.isReadyForMoreMediaData { usleep(1000) }
  adaptor.append(buffer(dir.appendingPathComponent(String(l[0]))), withPresentationTime: CMTime(value: CMTimeValue(ms), timescale: 1000))
  lastMs = ms
}
input.markAsFinished()
writer.endSession(atSourceTime: CMTime(value: CMTimeValue(lastMs + 1500), timescale: 1000))
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
print(writer.status == .completed ? out.path : "failed: \(String(describing: writer.error))")
