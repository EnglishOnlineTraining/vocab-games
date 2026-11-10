// Saves stills from an MP4 so a recording can be checked by eye (macOS's own decoder, as QuickTime uses).
// Usage: swift check-frames.swift <video.mp4> <out dir> <seconds> [seconds…]
// Times past the end of the video are skipped. Prints each still's path, or an error and exits 1.
import AVFoundation
import AppKit

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write("check-frames: \(msg)\n".data(using: .utf8)!)
  exit(1)
}

let a = CommandLine.arguments
guard a.count >= 4 else { fail("usage: swift check-frames.swift <video.mp4> <out dir> <seconds> [seconds…]") }
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let duration = asset.duration.seconds
guard duration > 0 else { fail("can't open \(a[1]) as a video") }
let gen = AVAssetImageGenerator(asset: asset)
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
for t in a.dropFirst(3).compactMap(Double.init) where t < duration {
  let file = "\(a[2])/t\(t).jpg"
  guard let img = try? gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil),
        let jpg = NSBitmapImageRep(cgImage: img).representation(using: .jpeg, properties: [:]),
        (try? jpg.write(to: URL(fileURLWithPath: file))) != nil else { fail("can't save the still at \(t) s to \(file)") }
  print(file)
}
print("duration \(duration)")
