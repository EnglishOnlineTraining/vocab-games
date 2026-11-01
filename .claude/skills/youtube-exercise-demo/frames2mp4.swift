// Encodes JPEG frames into an H.264 MP4 with AVFoundation (no ffmpeg needed).
// Usage: swift frames2mp4.swift <frame dir> <out.mp4>
// The frame dir holds 000000.jpg … plus times.txt: one "<file> <ms since start>" per line.
// The video takes its size from the first frame. Prints the MP4 path, or an error and exits 1.
import AVFoundation
import AppKit

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write("frames2mp4: \(msg)\n".data(using: .utf8)!)
  exit(1)
}

let args = CommandLine.arguments
guard args.count == 3 else { fail("usage: swift frames2mp4.swift <frame dir> <out.mp4>") }
let dir = URL(fileURLWithPath: args[1]), out = URL(fileURLWithPath: args[2])
guard let list = try? String(contentsOf: dir.appendingPathComponent("times.txt"), encoding: .utf8) else {
  fail("can't read \(dir.path)/times.txt")
}
let lines = list.split(separator: "\n").map { $0.split(separator: " ") }.filter { $0.count == 2 }

func image(_ name: Substring) -> CGImage {
  let url = dir.appendingPathComponent(String(name))
  guard let img = NSImage(contentsOf: url)?.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fail("can't read frame \(url.path)")
  }
  return img
}
guard let first = lines.first else { fail("times.txt lists no frames") }
let size = image(first[0])
let W = size.width, H = size.height

try? FileManager.default.removeItem(at: out)
let writer: AVAssetWriter
do { writer = try AVAssetWriter(outputURL: out, fileType: .mp4) } catch { fail("can't write \(out.path): \(error)") }
// ~4 bits per pixel per second: 8 Mbps at 1080p, YouTube's recommended upload rate.
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: W * H * 4]])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])
writer.add(input)
guard writer.startWriting() else { fail("can't start writing: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)

func buffer(_ img: CGImage) -> CVPixelBuffer {
  var pb: CVPixelBuffer?
  guard let pool = adaptor.pixelBufferPool, CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb) == kCVReturnSuccess, let b = pb else {
    fail("can't get a pixel buffer: \(String(describing: writer.error))")
  }
  CVPixelBufferLockBaseAddress(b, [])
  defer { CVPixelBufferUnlockBaseAddress(b, []) }
  guard let ctx = CGContext(data: CVPixelBufferGetBaseAddress(b), width: W, height: H, bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(b), space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue) else { fail("can't draw into the pixel buffer") }
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
  return b
}

var lastMs = -1
for l in lines {
  guard let ms = Int(l[1]) else { fail("bad time in times.txt: \(l.joined(separator: " "))") }
  if ms <= lastMs { continue }  // timestamps must strictly increase
  while !input.isReadyForMoreMediaData { usleep(1000) }
  guard adaptor.append(buffer(image(l[0])), withPresentationTime: CMTime(value: CMTimeValue(ms), timescale: 1000)) else {
    fail("frame \(l[0]) rejected: \(String(describing: writer.error))")
  }
  lastMs = ms
}
input.markAsFinished()
writer.endSession(atSourceTime: CMTime(value: CMTimeValue(lastMs + 1500), timescale: 1000))
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
guard writer.status == .completed else { fail("encoding failed: \(String(describing: writer.error))") }
print(out.path)
