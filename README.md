# ddc-source-obsidian

obsidian source for ddc.vim

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### ddc.vim

https://github.com/Shougo/ddc.vim

### ripgrep

https://github.com/BurntSushi/ripgrep

## Configuration

```vim
	call ddc#custom#patch_filetype('markdown', #{
		\   sources: [ 'obsidian_tag', 'obsidian_link' ],
		\   sourcesParams: #{
		\     obsidian_tag: #{ vault: expand('~/zettelkasten') },
		\     obsidian_link: #{ vault: expand('~/zettelkasten') },
		\   }
		\ })
```
