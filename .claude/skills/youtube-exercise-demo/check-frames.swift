// Saves stills from an MP4 so a recording can be checked by eye (macOS's own decoder, as QuickTime uses).
// Usage: swift check-frames.swift <video.mp4> <out dir> <seconds> [seconds…]
// Times past the end of the video are skipped.
import AVFoundation
import AppKit

let a = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: a[1]))
let gen = AVAssetImageGenerator(asset: asset)
gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
let duration = asset.duration.seconds
for t in a.dropFirst(3).compactMap(Double.init) where t < duration {
  let img = try! gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil)
  let file = "\(a[2])/t\(t).jpg"
  try! NSBitmapImageRep(cgImage: img).representation(using: .jpeg, properties: [:])!.write(to: URL(fileURLWithPath: file))
  print(file)
}
print("duration \(duration)")
