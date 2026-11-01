#!/usr/bin/env python3
"""Turn a tiny markup into Gutenberg blocks.

Blank-line separated chunks: "## " h2, "- " list, "> " quote (one line per <br>),
a chunk starting "<!-- wp:" passes through, anything else is a paragraph.
Usage: build_blocks.py src/<post>.txt > <post>.html
"""
import sys

out = []
for chunk in open(sys.argv[1]).read().strip().split("\n\n"):
    lines = chunk.strip().split("\n")
    if lines[0].startswith("## "):
        out.append(f'<!-- wp:heading -->\n<h2 class="wp-block-heading">{lines[0][3:]}</h2>\n<!-- /wp:heading -->')
    elif lines[0].startswith("- "):
        li = "\n".join(f"<!-- wp:list-item -->\n<li>{l[2:]}</li>\n<!-- /wp:list-item -->" for l in lines)
        out.append(f'<!-- wp:list -->\n<ul class="wp-block-list">\n{li}\n</ul>\n<!-- /wp:list -->')
    elif lines[0].startswith("> "):
        body = "<br>".join(l[2:] for l in lines)
        out.append(f'<!-- wp:quote -->\n<blockquote class="wp-block-quote"><!-- wp:paragraph -->\n<p>{body}</p>\n<!-- /wp:paragraph --></blockquote>\n<!-- /wp:quote -->')
    elif lines[0].startswith("<!-- wp:"):
        out.append(chunk)
    else:
        out.append(f'<!-- wp:paragraph -->\n<p>{" ".join(lines)}</p>\n<!-- /wp:paragraph -->')
print("\n\n".join(out))
