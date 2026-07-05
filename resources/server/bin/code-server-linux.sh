#!/usr/bin/env sh
#
# Copyright (c) Microsoft Corporation. All rights reserved.
#

case "$1" in
	--inspect*) INSPECT="$1"; shift;;
esac

ROOT="$(dirname "$(dirname "$(readlink -f "$0")")")"

# Set rpath before changing the interpreter path
# Refs https://github.com/NixOS/patchelf/issues/524
if [ -n "$OASIS_SERVER_CUSTOM_GLIBC_LINKER" ] && [ -n "$OASIS_SERVER_CUSTOM_GLIBC_PATH" ] && [ -n "$OASIS_SERVER_PATCHELF_PATH" ]; then
	echo "Patching glibc from $OASIS_SERVER_CUSTOM_GLIBC_PATH with $OASIS_SERVER_PATCHELF_PATH..."
	"$OASIS_SERVER_PATCHELF_PATH" --set-rpath "$OASIS_SERVER_CUSTOM_GLIBC_PATH" "$ROOT/node"
	echo "Patching linker from $OASIS_SERVER_CUSTOM_GLIBC_LINKER with $OASIS_SERVER_PATCHELF_PATH..."
	"$OASIS_SERVER_PATCHELF_PATH" --set-interpreter "$OASIS_SERVER_CUSTOM_GLIBC_LINKER" "$ROOT/node"
	echo "Patching complete."
fi

"$ROOT/node" ${INSPECT:-} "$ROOT/out/server-main.js" "$@"
