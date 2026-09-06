package com.runup.tv.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.runup.tv.domain.StreamingInfo

object StreamingLauncher {
    private const val DISNEY_PACKAGE = "com.disney.disneyplus"
    private const val HOTSTAR_TV_PACKAGE = "in.startv.hotstar.dplus.tv"
    private const val HOTSTAR_PHONE_PACKAGE = "in.startv.hotstar"

    fun openInProvider(context: Context, streaming: StreamingInfo?) {
        if (streaming == null) {
            openSearch(context, "JioHotstar Marvel")
            return
        }

        when (streaming.provider) {
            "hotstar" -> openHotstar(context, streaming)
            "disney-plus" -> openDisneyPlus(context, streaming)
            else -> openSearch(context, streaming.searchQuery)
        }
    }

    private fun openDisneyPlus(context: Context, streaming: StreamingInfo) {
        val contentId = streaming.contentId
        if (!contentId.isNullOrBlank()) {
            val uri = Uri.parse("https://www.disneyplus.com/play/$contentId")
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage(DISNEY_PACKAGE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (intent.resolveActivity(context.packageManager) != null) {
                context.startActivity(intent)
                return
            }
        }

        openSearch(context, streaming.searchQuery)
    }

    private fun openHotstar(context: Context, streaming: StreamingInfo) {
        val contentId = streaming.contentId
        if (!contentId.isNullOrBlank()) {
            val segment = if (streaming.contentType == "show") "shows" else "movies"
            val uri = Uri.parse("https://www.hotstar.com/in/$segment/-/$contentId")
            val tvIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage(HOTSTAR_TV_PACKAGE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (tvIntent.resolveActivity(context.packageManager) != null) {
                context.startActivity(tvIntent)
                return
            }

            val phoneIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage(HOTSTAR_PHONE_PACKAGE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (phoneIntent.resolveActivity(context.packageManager) != null) {
                context.startActivity(phoneIntent)
                return
            }

            val genericIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (genericIntent.resolveActivity(context.packageManager) != null) {
                context.startActivity(genericIntent)
                return
            }
        }

        openSearch(context, streaming.searchQuery)
    }

    private fun openSearch(context: Context, query: String) {
        val intent = Intent(Intent.ACTION_WEB_SEARCH).apply {
            putExtra("query", query)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (intent.resolveActivity(context.packageManager) != null) {
            context.startActivity(intent)
            return
        }

        val fallback = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=${Uri.encode(query)}")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(fallback)
    }
}
